import { BadRequestError } from "@src/utils/app_error";
import { BaseService } from "../baseService";
import { ActivateThemeInput, UpdateWebsiteVersionInput } from "@src/routes/websites/schema";

export class WebsiteService extends BaseService {
  async getWebsitesForProfile(profileId: string) {
    const websites = await this.models.WebsiteVersion.getManyWithPages({ profileId });
    return websites;
  }

  async getWebsite(websiteVersionId: string, profileId: string) {
    const website = await this.models.WebsiteVersion.getOneWithPages({ websiteVersionId, profileId });
    return website;
  }

  async updateWebsiteVersion(input: UpdateWebsiteVersionInput, websiteVersionId: string) {
    const trx = await this.database.client.startTransaction().execute();

    try {
      for (const page of input.pages) {
        await this.models.WebsiteVersionPage.updateOne(
          { websiteVersionId: websiteVersionId, pathname: page.pathname },
          { content: page.content },
          trx,
        );
      }

      await this.models.WebsiteVersion.updateOne({ id: websiteVersionId }, { themeSettings: input.themeSettings }, trx);

      await trx.commit().execute();
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }

  async publishWebsiteVersion(websiteVersionId: string, profileId: string) {
    const trx = await this.database.client.startTransaction().execute();

    try {
      await this.models.WebsiteVersion.updateMany({ profileId, isActive: true }, { isActive: false }, trx);
      await this.models.WebsiteVersion.updateOne({ id: websiteVersionId, profileId }, { isActive: true }, trx);
      await trx.commit().execute();
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }

  async activateTheme(input: ActivateThemeInput) {
    // TODO: Validate that the theme has all the required pages
    const currentWebsite = await this.models.WebsiteVersion.findOne({
      profileId: input.profileId,
      isActive: true,
    });

    const trx = await this.database.client.startTransaction().execute();

    try {
      //TODO: Increment the version per profile not database wide
      const websiteVersion = await this.models.WebsiteVersion.insertOne(
        {
          profileId: input.profileId,
          themeName: input.theme.slug,
          themeVersion: input.theme.version,
          themeSettings: input.theme.themeSettings,
          themeThumbnail: input.theme.thumbnail,
          isActive: !currentWebsite,
        },
        trx,
      );

      await this.models.WebsiteVersionPage.insertMany(
        input.theme.pages.map((page) => ({
          websiteVersionId: websiteVersion.id,
          pathname: page.pathname,
          title: page.title,
          content: page.json,
          description: page.description,
        })),
        trx,
      );

      await trx.commit().execute();
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }
  async getPublicWebsite({ subdomain, pathname }: { subdomain: string; pathname: string }) {
    const profile = await this.models.Profile.findOne({ subdomain });
    console.log("profile", subdomain, pathname);

    if (!profile) {
      throw new BadRequestError("Profile not found");
    }

    const website = await this.models.WebsiteVersion.getOneWithPages({ profileId: profile.id, isActive: true });

    if (!website) {
      throw new BadRequestError("Website not found");
    }
    const page = website.pages.find((page) => page.pathname === pathname);
    if (!page) {
      throw new BadRequestError("Page not found");
    }

    return {
      page,
      themeSettings: website.themeSettings,
      themeName: website.themeName,
      themeVersion: website.themeVersion,
      profile: {
        id: profile.id,
        name: profile.name,
        subdomain: profile.subdomain,
      },
    };
  }
}

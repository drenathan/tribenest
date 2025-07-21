import { Services } from "@src/services";
import { PolicyFunction } from "@src/types";

export const getAll: PolicyFunction = async (req, services) => {
  return true;
};

const isOwner = async (profileId: string, accountId: string, services: Services) => {
  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });
  return isOwner;
};

export const create: PolicyFunction = async (req, services) => {
  const profileId = req.body?.profileId ?? (req.query?.profileId as string);
  const accountId = req.account?.id;

  if (!profileId || !accountId) {
    return false;
  }

  return isOwner(profileId, accountId, services);
};

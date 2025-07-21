import { PolicyFunction } from "@src/types";

export const uploadMedia: PolicyFunction = async (req, services) => {
  const profileId = req.params?.id;
  const accountId = req.account?.id;

  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

export const update: PolicyFunction = async (req, services) => {
  const profileId = req.params?.id;
  const accountId = req.account?.id;

  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });
  return isOwner;
};

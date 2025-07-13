import { PolicyFunction } from "@src/types";

export const getAll: PolicyFunction = async (req, services) => {
  return true;
};

export const create: PolicyFunction = async (req, services) => {
  const profileId = req.body.profileId;
  const accountId = req.account?.id;

  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

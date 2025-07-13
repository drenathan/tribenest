import { PolicyFunction } from "@src/types";

export const create: PolicyFunction = async (req, services) => {
  const profileId = req.body.profileId;
  const accountId = req.account?.id;

  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

export const getMany: PolicyFunction = async (req, services) => {
  const profileId = req.query.profileId as string;
  const accountId = req.account?.id;

  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

import { PolicyFunction } from "@src/types";

export const getAll: PolicyFunction = async (req, services) => {
  const profileId = req.body?.profileId ?? req.query.profileId;
  const accountId = req.account?.id;
  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

export const create: PolicyFunction = async (req, services) => {
  const profileId = req.body?.profileId ?? req.query.profileId;
  const accountId = req.account?.id;
  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

export const update: PolicyFunction = async (req, services) => {
  const profileId = req.body?.profileId ?? req.query?.profileId;
  const accountId = req.account?.id;
  if (!profileId || !accountId) {
    return false;
  }

  const isOwner = await services.profileAuthorization.isOwner({ profileId, accountId });

  return isOwner;
};

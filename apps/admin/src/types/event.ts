export interface IEvent {
  id: string;
  profileId: string;
  dateTime: string;
  address: {
    name: string;
    street: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  title: string;
  description?: string;
  actionText: string;
  actionLink: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  profileId: string;
  dateTime: string;
  address: {
    name: string;
    street: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  title: string;
  description?: string;
  actionText: string;
  actionLink: string;
}

export interface UpdateEventInput {
  id: string;
  profileId: string;
  dateTime: string;
  address: {
    name: string;
    street: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  title: string;
  description?: string;
  actionText: string;
  actionLink: string;
}

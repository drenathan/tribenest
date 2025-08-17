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
  tickets: ITicket[];
}

export interface ITicket {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  archivedAt?: string;
  sold: number;
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
  actionText?: string;
  actionLink?: string;
}

import selectors from "@tribe-nest/email-selectors";

export type EmailContainerProps = {
  children?: React.ReactNode;
  className?: string;
  width?: string;
};

export const EmailContainer = selectors.EmailContainer;

EmailContainer.craft = {
  displayName: "Container",
  props: {
    width: "100%",
  },
  custom: {
    preventDelete: true,
  },
};

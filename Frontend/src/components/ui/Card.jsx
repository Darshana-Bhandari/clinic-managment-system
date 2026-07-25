import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = true,
  padding = true,
  as: Component = 'div',
  ...props
}) => {
  const paddingClass = padding ? 'card-body' : '';
  const hoverClass = hoverable ? 'card-hover' : '';

  return (
    <Component
      className={`card ${paddingClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

export default Card;
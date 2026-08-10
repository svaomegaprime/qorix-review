export default function Text({
  as = "h2",
  children,
  color = "inherit",
  ...props
}) {
  const isRegularText = as === "p" || as === "span" || as === "a";
  const style = {
    ...props.style,
    margin: "0",
    padding: !isRegularText ? "6px 0" : "0",
    fontWeight: !isRegularText ? "600" : "inherit",
    color: color,
  };
  return (
    <>
      {as === "h1" && <h1 style={style}>{children}</h1>}
      {as === "h2" && <h2 style={style}>{children}</h2>}
      {as === "h3" && <h3 style={style}>{children}</h3>}
      {as === "h4" && <h4 style={style}>{children}</h4>}
      {as === "h5" && <h5 style={style}>{children}</h5>}
      {as === "h6" && <h6 style={style}>{children}</h6>}
      {as === "p" && <p style={style}>{children}</p>}
      {as === "span" && (
        <span onClick={props?.onClick} style={style}>
          {children}
        </span>
      )}
      {as === "a" && (
        <a
          style={style}
          href={props.href}
          {...(props?.target ? { target: props.target } : {})}
        >
          {children}
        </a>
      )}
    </>
  );
}

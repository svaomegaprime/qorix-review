import { Filter } from 'bad-words'


const filter = new Filter();

export const profanityFilter = (content) => {

    const hasProfanity = filter.isProfane(content);
    const cleanContent = filter.clean(content);

    return {
        hasProfanity,
        cleanContent,
    };
};


export const personalInfoFilter = (content) => {
  if (!content || typeof content !== "string") {
    return content;
  }

  let sanitized = content;

  // Email addresses
  sanitized = sanitized.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    "****"
  );

  // Phone numbers (supports international formats)
  sanitized = sanitized.replace(
    /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{6,15}\d/g,
    "****"
  );

  return sanitized;
};
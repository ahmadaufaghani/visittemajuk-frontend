export const emptyDescriptionChecking = (content: string): boolean => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const pElements = doc.getElementsByTagName('p');

  if(pElements.length > 0) {
    const filledElements = Array.from(pElements).filter(val => val.innerText !== "" && val.innerText !== " ");
    if(filledElements.length >= 1) {
      return false;
    }
  }

  return true;
}
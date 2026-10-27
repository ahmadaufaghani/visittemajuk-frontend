export const generateShortDescriptionFromHTML = (element : string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(element, 'text/html');
    return doc.getElementsByTagName('p')[0].innerText;
}

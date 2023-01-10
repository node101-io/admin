/*
  Takes a DOM element and a string class name as parameter (Class name assumed to not have a point (.) at start)
  If the element or any of the parents contains the specified class name, returns the found element
  Else returns null
*/

function ancestorWithClassName(element, className) {
  while (element && element.classList) {
    if (element.classList.contains(className))
      return element;

    element = element.parentNode ? element.parentNode : null;
  }

  return null;
}

// Simple hack to add methods to the constructor prototype
// Allows multiple functions to be included
module.exports = async function addMethods(targetClass, functionList) {
  for (oneFunction of functionList) {
    if (["undefined", "anonymous"].includes(oneFunction.name)) {
      throw new Error("Nameless functions are not supported");
    }
    targetClass.prototype[oneFunction.name] = oneFunction;
  }
  return targetClass;
}
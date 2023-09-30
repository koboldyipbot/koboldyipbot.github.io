// https://egghead.io/blog/object-pool-design-pattern
const OBJECT_POOL_INCREASE_PERCENT = 50
const OBJECT_POOL_MINIMUM_PERCENT_FREE = 10

class ObjectPoolMember {
  previousElement = null
  nextElement = null
  free = true
  constructor(data) {
    this.data = data
  }
}

class ObjectPool {
  poolArray = []
  freeElements = 0
  nextFree = null
  lastFree = null
  resetFunction = () => {}
  constructorFunction = () => {}
  constructor(
    constructorFunction,
    resetFunction = (obj) => obj,
    initialSize = 1000,
  ) {
    this.resetFunction = resetFunction
    this.constructorFunction = constructorFunction
    for (let i = 0; i < initialSize; i++) this.createElement()
    this.nextFree = this.poolArray[0]
  }
  createElement() {
    this.freeElements++
    const data = this.resetFunction(this.constructorFunction())
    const newObjectPoolMember = new ObjectPoolMember(data)
    this.poolArray.push(newObjectPoolMember)
    if (!this.lastFree) {
      this.lastFree = newObjectPoolMember
    } else {
      this.linkElement(newObjectPoolMember)
    }
    return newObjectPoolMember
  }
  linkElement(element) {
    element.previousElement = this.lastFree
    this.lastFree.nextElement = element
    this.lastFree = element
  }
  unlinkFirstElement(element) {
    this.nextFree = element.nextElement
    this.nextFree.previousElement = null
    element.nextElement = this.previousElement = null
  }
  catchElement(element) {
    element.free = false
    this.freeElements--
    if (
      this.freeElements / this.poolArray.length <
      OBJECT_POOL_MINIMUM_PERCENT_FREE / 100
    ) {
      const increaseSize = Math.round(
        (OBJECT_POOL_INCREASE_PERCENT * this.poolArray.length) / 100,
      )
      for (let i = 0; i < increaseSize; i++) {
        this.createElement()
      }
      this.freeElement += increaseSize
    }
  }
  getElement() {
    const availableElement = this.nextFree
    this.unlinkFirstElement(availableElement)
    this.catchElement(availableElement)
    return availableElement
  }
  setElementAsFree(element) {
    element.free = true
    this.linkElement(element)
    this.freeElements++
  }
  releaseElement(element) {
    this.setElementAsFree(element)
    this.resetFunction(element.data)
  }
}
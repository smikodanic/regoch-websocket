process.nextTick(() => {
  console.log('Processed in next iteration');
});
console.log('Processed in the first iteration');

for (let i = 1; i <= 10; i++) {
  process.nextTick(() => {
    console.log(`Processed in next iteration. i=${i}`);
  });
}

console.log('Processed in the first iteration');

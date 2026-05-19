import autocannon from "autocannon";
import axios from "axios";

const benchmark = (url, label) => {
  return new Promise((resolve) => {
    console.log(`\nRunning: ${label}`);
    const instance = autocannon(
      {
        url,
        connections: 50,
        duration: 10,
      },
      (err, result) => {
        console.log(`\n=== ${label} ===`);
        console.log(`Requests/sec: ${result.requests.average}`);
        console.log(`Latency avg:  ${result.latency.average}ms`);
        console.log(`Latency p99:  ${result.latency.p99}ms`);
        console.log(
          `Throughput:   ${(result.throughput.average / 1024).toFixed(2)} KB/s`,
        );
        console.log(`Errors:       ${result.errors}`);
        resolve(result);
      },
    );
    autocannon.track(instance, { renderProgressBar: true });
  });
};

console.log("Starting Bookstore API Benchmark...\n");

// run WITHOUT cache — delete cache first
await axios
  .delete("http://localhost:3000/api/books/flush-cache")
  .catch(() => {});
const without = await benchmark(
  "http://localhost:3000/api/books/all",
  "GET /books/all (NO cache — hits MongoDB)",
);

// warm up cache
await axios.get("http://localhost:3000/api/books/all");

// run WITH cache
const with_cache = await benchmark(
  "http://localhost:3000/api/books/all",
  "GET /books/all (WITH Redis cache)",
);

console.log("\n=== COMPARISON ===");
console.log(
  `Latency improvement: ${(without.latency.average - with_cache.latency.average).toFixed(2)}ms faster with cache`,
);
console.log(
  `Throughput improvement: ${((with_cache.requests.average / without.requests.average - 1) * 100).toFixed(1)}% more requests/sec with cache`,
);

process.exit();

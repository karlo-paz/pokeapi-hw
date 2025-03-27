import { exec } from "child_process";
import { getPokemonByName } from "./index.js"; 

const name = process.argv[2];

if (!name) {
  console.error("Usage: node test.js <pokemon_name>");
  process.exit(1);
}

function fetchPokemonWithCurl(name) {
  return new Promise((resolve, reject) => {
    exec(`curl -s https://pokeapi.co/api/v2/pokemon/${name}`, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

(async () => {
  try {
    const [curlData, nodeData] = await Promise.all([
      fetchPokemonWithCurl(name),
      getPokemonByName(name)
    ]);
    if (!curlData || !nodeData) {
      console.error("❌ Test Failed: Could not fetch data");
      process.exit(1);
    }

    // Compare both results
    if (JSON.stringify(curlData) === JSON.stringify(nodeData)) {
      console.log("✅ Test Passed: Both methods return the same result.");
      process.exit(0);
    } else {
      console.error("❌ Test Failed: The results are different.");
      console.log("\n--- CURL Data ---\n", JSON.stringify(curlData, null, 2));
      console.log("\n--- Node Data ---\n", JSON.stringify(nodeData, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test Failed: Error fetching data", error);
    process.exit(1);
  }
})();

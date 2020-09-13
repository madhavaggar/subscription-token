var fs = require("fs");
const compileContract = require("./compile");
const deployContract = require("./deploy");
const config = require("../../contractsConfig.json");

const admin = require(`../keystore/${config.keyName}`);

require.extensions[".tz"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};

async function main() {
  // Compile and deploy WasteToken Contract
  try {
    console.log("Compiling WasteToken Contract");
    await compileContract(
      "main",
      "WasteToken",
      `(sp.address('${admin.publicKeyHash}'))`
    );
    console.log("Deploying WasteToken Contract");
    const tokenContract = await deployContract("main", "WasteToken", "admin");
    const tokenContractAddress = tokenContract.address;
    console.log("Deployed WasteToken Contract at:", tokenContractAddress);

    /*    console.log("Compiling Subscription Contract");
    await compileContract(
      "main",
      "Subscription",
      `(sp.address('${admin.publicKeyHash}'))`
    );
    
    console.log("Deploying Subscription Contract");
    const subscriptionContract = await deployContract("main", "Subscription", "admin");
    const subscriptionContractAddress = subscriptionContract.address;
    console.log("Deployed Subscription Contract at:", subscriptionContractAddress);
    */

    console.log("Updating config file");
    // Update the contract addresses
    var configFile = JSON.parse(
      fs.readFileSync("./contractsConfig.json").toString()
    );
    configFile.WasteTokenContractAddress = tokenContract.address;
    fs.writeFile(
      "./contractsConfig.json",
      JSON.stringify(configFile, null, 2),
      () => {}
    );
    
    var srcfile = JSON.parse(
      fs.readFileSync("../../src/contracts/config.jsons").toString()
    );

    srcfile.WasteTokenContractAddress = tokenContract.address;
    //configFile.SubscriptionContractAddress = subscriptionContract.address;
    
    fs.writeFile(
      "./contractsConfig.json",
      JSON.stringify(srcFile, null, 2),
      () => {}
    );
    console.log("Updated config file [COMPLETE]");
  } catch (error) {
    if (!error.response) {
      console.log("Error:", error);
      return;
    }
    const response = JSON.parse(error.response);
    if (response[0].contents) {
      console.log(
        "Error:",
        JSON.parse(error.response)[0].contents[0].metadata.operation_result
      );
      return;
    } else if (error.response[0]) {
      console.log("Error:", response[0]);
      return;
    } else {
      console.log("Error:", error);
      return;
    }
  }

  return;
}

main();

const exec = require("child_process").exec;
const config = require("../../contractsConfig.json");
const admin = require(`../keystore/${config.keyName}`);

async function compileContract(filename, className, params) {
  return new Promise((resolve, reject) => {
    const filePath = config.location + filename + ".py";
    const buildDirectory =
      config.buildDirectory + filename + "/" + className;
    const classAndParams = `"${className + params}"`;
    console.log("Successfull calling upto here",admin)

    exec(
      `./utils/smartpy-cli/SmartPy.sh compile ./${filePath} ${classAndParams} ./${buildDirectory}`,
      function (error, stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        resolve();
        if (error !== null) {
          console.log("exec error: " + error);
          reject(error);
        }
      }
    );
  });
}
// (async () => {
//   const params = `(sp.address('${admin.publicKeyHash}'))`;
//   await compileContract("main", "WasteToken", params);
// })();
module.exports = compileContract;

const child = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Logs to the console
 */
const log = (msg) => console.log("\n", msg);

/**
 * Exits the current process with an error code and message
 */
const exit = (msg) => {
	console.error(msg);
	process.exit(1);
};

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = (cmd, cwd) => child.execSync(cmd, { encoding: "utf8", stdio: "inherit", cwd });

/**
 * Determines the current operating system (one of ["mac", "windows", "linux"])
 */
const getPlatform = () => {
	switch (process.platform) {
		case "darwin":
			return "mac";
		case "win32":
			return "windows";
		default:
			return "linux";
	}
};

/**
 * Returns the value for an environment variable (or `null` if it's not defined)
 */
const getEnv = (name) => process.env[name.toUpperCase()] || null;

/**
 * Sets the specified env variable if the value isn't empty
 */
const setEnv = (name, value) => {
	if (value) {
		process.env[name.toUpperCase()] = value.toString();
	}
};

/**
 * Returns the value for an input variable (or `null` if it's not defined). If the variable is
 * required and doesn't have a value, abort the action
 */
const getInput = (name, required) => {
	const value = getEnv(`INPUT_${name}`);
	if (required && !value) {
		exit(`"${name}" input variable is not defined`);
	}
	return value;
};

(() => {

	const pkgRoot = path.resolve(".");
	const pkgJsonPath = path.join(pkgRoot, "package.json");
	const pkgLockPath = path.join(pkgRoot, "package-lock.json");

	// Make sure `package.json` file exists
	if (!fs.existsSync(pkgJsonPath)) {
		exit(`\`package.json\` file not found at path "${pkgJsonPath}"`);
	}

	// Copy "gh_token" input variable to "GH_TOKEN" env variable (required by `electron-builder`)
	setEnv("GH_TOKEN", getInput("gh_token", true));

	// Require code signing certificate and password if building for macOS. Export them to environment
	// variables (required by `electron-builder`)
	const platform = getPlatform();
	if (platform === "mac") {
		setEnv("CSC_LINK", getInput("mac_cert"));
		setEnv("CSC_KEY_PASSWORD", getInput("mac_cert_password"));
	} else if (platform === "windows") {
		setEnv("CSC_LINK", getInput("win_cert"));
		setEnv("CSC_KEY_PASSWORD", getInput("win_cert_password"));
	}

	// Disable console advertisements during install phase
	setEnv("ADBLOCK", true);

	log(`Installing dependencies…`);
	run("npm install", pkgRoot);

	const release = getInput("release", true) === "true";
	log(`Building${release ? " and releasing" : ""} the Electron app…`);
	const args = getInput("args") || "";
	const cmd = "electron-builder build";
	try {
		run(`npx --no-install ${cmd} --publish ${release ? "always" : "never"} ${args}`, pkgRoot);
	} catch (err) {
		log(`Build failed:`);
		log(err);
		throw err;
	}

})();
const { spawnSync } = require("child_process");

const amazonUrl = "https://www.amazon.de/-/en/gp/cart/view.html?ref_=nav_cart";

const result = spawnSync("cmd.exe", ["/c", "start", "", amazonUrl], {
    stdio: "inherit",
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);

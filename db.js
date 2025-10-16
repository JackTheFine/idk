const fs = require("fs");

const globals = {};
let db = "./db.json";
let exists = false;

function get(key) {
  return globals[key] || false;
}

function getAll() {
  return globals;
}

function set(key, value) {
  globals[key] = value;
  return get(key);
}

function save() {
  fs.writeFileSync(db, JSON.stringify(getAll(), null, 4), "utf-8");
}

function loadFromFile(filename) {
  db = filename;
  if (!fs.existsSync(filename)) return;

  exists = true;

  let file = JSON.parse(fs.readFileSync(filename, "utf-8"));
  Object.keys(file).forEach(key => set(key, file[key]));

}

function alreadyExists() {
  return exists;
}

module.exports = { alreadyExists, get, getAll, set, save, loadFromFile };
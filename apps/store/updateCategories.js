import fs from "fs";

const filePath = "./db.json";

const db = JSON.parse(fs.readFileSync(filePath, "utf8"));

const categoryMap = {
  Men: "Fashion",
  Women: "Fashion",
  Shoes: "Fashion",
  Accessories: "Fashion",
};

db.products = db.products.map((product) => ({
  ...product,
  category: categoryMap[product.category] || product.category,
}));

fs.writeFileSync(filePath, JSON.stringify(db, null, 2));

console.log("Product categories updated successfully.");
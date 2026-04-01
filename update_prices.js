const fs = require('fs');
const glob = require('glob'); // Not available? I'll just use known files

const files = [
  "d:/DSfactor_Web/src/app/profile/page.tsx",
  "d:/DSfactor_Web/src/app/products/[id]/page.tsx",
  "d:/DSfactor_Web/src/app/products/page.tsx",
  "d:/DSfactor_Web/src/app/page.tsx",
  "d:/DSfactor_Web/src/app/checkout/page.tsx",
  "d:/DSfactor_Web/src/app/checkout/custom/[id]/page.tsx",
  "d:/DSfactor_Web/src/app/cart/page.tsx",
  "d:/DSfactor_Web/src/app/admin/custom-orders/page.tsx",
  "d:/DSfactor_Web/src/app/admin/page.tsx",
  "d:/DSfactor_Web/src/app/admin/products/page.tsx",
  "d:/DSfactor_Web/src/app/admin/orders/page.tsx"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We want to replace .toFixed(2) in JSX such as {price.toFixed(2)} or {(qty * price).toFixed(2)}
    // with {Number(price.toFixed(2)).toString()} or similar.
    // However, string replace is safest.
    
    // Instead of complex regex, let's just do:
    // .toFixed(2) => .toFixed(2)  (Wait, we want to remove the extra zeros)
    // the easiest way is replacing `.toFixed(2)}` with `.toFixed(2).replace(/\.?0+$/, "")}` ? No, .replace(/\.00$/, '') is better.
    // Actually, just cast to Number: Number(...).toString() 
    
    // A simpler replacement:
    // If we replace \.toFixed\(2\) with \.toFixed(2).replace(/\.00$/, '') it will strip .00 but leave .50
    // If we want to strip all trailing zeros after decimal: \.toFixed(2).replace(/\.?0+$/, '')
    // This is safe in JS!
    // Example: (150).toFixed(2).replace(/\.?0+$/, '') => "150"
    // (150.5).toFixed(2).replace(/\.?0+$/, '') => "150.5"
    // (150.55).toFixed(2).replace(/\.?0+$/, '') => "150.55"
    // This perfectly matches "without any additions" but correctly displays true decimals if they exist.
    
    if (content.includes('.toFixed(2)')) {
      const newContent = content.replace(/\.toFixed\(2\)/g, ".toFixed(2).replace(/\\.00$/, '')");
      
      fs.writeFileSync(file, newContent);
      console.log(`Updated ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
}

import sharp from 'sharp';
for(const name of ['hero','serum','lip','cream','cleanser']){
 await sharp(`assets/${name}-source.png`).resize({width:name==='hero'?1536:800,withoutEnlargement:true}).webp({quality:85}).toFile(`assets/${name}.webp`);
}
console.log('Optimized all five campaign images.');

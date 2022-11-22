// function getMode() {
//     let i;
//     for (i = 0; i < process.argv.length; i++) {
//         const arg = process.argv[i];
//         let pick;
//         pick = arg.match(/^--dev/g);
//         if (pick !== null) {
//             return pick.shift().split('--').pop();
//         }
//         pick = arg.match(/^--prod/g);
//         if (pick !== null) {
//             return pick.shift().split('--').pop();
//         }
//     }
// }

// const mode = getMode();
// console.log('mode :>> ', mode);
// console.log('process.env.NODE_ENV :>> ', process.env.NODE_ENV);
let mode;

if (process.env.NODE_ENV === 'development') {
    mode = 'dev';
}
else if (process.env.NODE_ENV === 'production') {
    mode = 'prod';
}

require('dotenv').config({ path: `.env.${mode}` });
console.log('process.env :>> ', process.env);
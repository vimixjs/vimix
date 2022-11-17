export async function build(...args: string[]) {
  console.log(args);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});

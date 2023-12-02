# kv-sql

aim for this project is to parse sqlite ast -> write | read data -> to | from -> browser local storage / kv storage

### external files

Files from external repositories or websites:  
[pegjs/sqlite-parser.pegjs](https://github.com/codeschool/sqlite-parser)  
[src/test/sqlite.test.data.ts](https://www.sqlitetutorial.net/sqlite-sample-database/)

### generate parser

generate typescript file `gen/sqlite.parser.ts`
```shell
npm run generate
```

### Other

[documentation about data format inside tidb](https://www.pingcap.com/blog/tidb-internal-computing/)
# kv-sql

aim for this project is to parse sqlite ast -> write | read data -> to | from -> browser local storage / kv storage

### external files

Files from external repositories or websites:  
[pegjs/sqlite-parser.pegjs](https://github.com/codeschool/sqlite-parser)  
[src/test/sqlite.test.data.ts](https://www.sqlitetutorial.net/sqlite-sample-database/)

### generate parser

generate peg parser typescript file `gen/sqlite.parser.ts`
```shell
npm run generate
```

### example page
1. click `Propagate Data` to fill `localStorage` with sample data
   - now its possible to execute sample sql queries
2. click clear data to clear `localStorage` from keys

### sample working sql queries
```sql
select * from artists limit 10 offset 10;
select * from artists order by ArtistId desc;
select * from artists where ArtistId > 1 and ArtistId < 10;
update artists set Name = 'foo' where ArtistId = 1;
select Name from artists;
update artists set Name = 'foo' where ArtistId < 10;
select * from artists where Name = 'foo';
delete from artists where ArtistId < 5;
select * from artists where ArtistId in (1, 6, 8, 121);
delete from artists where Name = 'foo';
select * from artists limit 100 offset 277;
select * from artists order by ArtistId desc limit 5 offset 10;
insert into artists VALUES (276, 'foo');
select * from artists where artists.ArtistId in (select ArtistId from albums)
```

### Other

[documentation about data format inside tidb](https://www.pingcap.com/blog/tidb-internal-computing/)
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

insert
```sql
insert into artists VALUES (276, 'foo');
```

select  
```sql
select * from artists limit 10 offset 10;
select * from artists order by ArtistId desc;
select * from artists where ArtistId > 1 and ArtistId < 10;
select Name from artists;
select * from artists where Name = 'foo';
select * from artists where ArtistId in (1, 6, 8, 121);
select * from artists limit 100 offset 277;
select * from artists order by ArtistId desc limit 5 offset 10;
select * from artists where artists.ArtistId in (select ArtistId from albums);
select * from artists where artists.ArtistId not in (select ArtistId from albums);
```

update  
```sql
update artists set Name = 'foo' where ArtistId = 1;
update artists set Name = 'foo' where ArtistId < 10;
```

delete
```sql
delete from artists where ArtistId = 1;
delete from artists where ArtistId < 5;
delete from artists where Name = 'foo';
```

special  
```sql
SELECT * FROM sqlite_schema;
SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';
```

### Other

[documentation about data format inside tidb](https://www.pingcap.com/blog/tidb-internal-computing/)
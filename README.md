# kv-sql

aim for this project is to parse sqlite ast -> write | read data -> to | from -> browser local storage / kv storage

### design
sql parsing is done in separate thread - it doesn't freeze ui 
- see `lib/parser/parser.worker.ts` and `lib/parser/async.parser.ts`  

data in rows is stored as doubly linked list  
data in tables is stored in one key  
all keys are prefixed by database name  
if something is not implemented it should throw `DBError` with type `DBErrorType`->`NOT_IMPLEMENTED`
- see `lib/db/db.error.ts`

### TODO   
- insert primary key autoincrement
- validate constraints on insert
- validate constraints on delete
- select insert from other table
- select joins
- execute statements in separate thread

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

create  
```sql
CREATE TABLE IF NOT EXISTS "foo" (
   "id" INTEGER NOT NULL,
   "bar" NVARCHAR(160) NOT NULL,
   "foobar" TEXT NOT NULL,
   PRIMARY KEY("id" AUTOINCREMENT)
);
```

alter  
```sql
alter table customers drop column Address;
alter table customers add column Address text not null default '';
```

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
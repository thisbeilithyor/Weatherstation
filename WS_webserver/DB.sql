CREATE TABLE img_directories (ID int AUTO_INCREMENT, data varchar(255), mytimestamp DATETIME DEFAULT CURRENT_TIMESTAMP, Primary Key (ID));
select * from (select * from temperature ORDER BY ID DESC limit 24) as last ORDER BY ID ASC;
select DATE_FORMAT(mytimestamp, '%H:%i') as hours_and_minutes from (select * from rain ORDER BY ID DESC limit 24) as last ORDER BY ID ASC;

create table image(ID int auto_increment, data LONGTEXT, mytimestamp datetime default CURRENT_TIMESTAMP, PRIMARY KEY(ID));
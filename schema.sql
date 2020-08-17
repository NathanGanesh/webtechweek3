create table if not exists quotes(
  id integer primary key,
  text text not null,
  attribution text,
  userId int not null default(0)
);

CREATE UNIQUE INDEX IF NOT EXISTS quotesUniqueIndex ON quotes(text,attribution);

insert or ignore into quotes(text,attribution) values("Common sense is the collection of prejudices acquired by age eighteen.", "Albert Einstein");
insert or ignore into quotes(text,attribution) values("Great minds discuss ideas; average minds discuss events; small minds discuss people.",
"Eleanor Roosevelt");
insert or ignore into quotes(text,attribution) values("If you aren't, at any given time, scandalized by code you wrote five or even three years ago, you're not learning anywhere near enough.", "Nick Black");
insert or ignore into quotes(text,attribution) values("What one programmer can do in one month, two programmers can do in two months.", "Fred Brooks");
insert or ignore into quotes(text,attribution) values("Never trust a computer you can't throw out a window.", "Steve Wozniak");
insert or ignore into quotes(text,attribution) values("Really, I'm not out to destroy Microsoft. That will just be a completely unintentional side effect.", "Linus Torvalds");
insert or ignore into quotes(text,attribution) values("I don't want to rule the universe. I just think it could be more sensibly organised.", "Eliezer Yudkowsky");
insert or ignore into quotes(text,attribution) values("The things you own end up owning you.", "Tyler Durden");
insert or ignore into quotes(text,attribution) values("You complete me.", "Jerry Maguire");


create table if not exists users(
  id integer primary key,
  name text not null unique,
  passwordHash text not null
);

create table if not exists comments(
  id integer primary key,
  quoteId int not null,
  userId int not null,
  time int not null,
  text text not null
);

CREATE INDEX IF NOT EXISTS commentsCompundIndex ON comments(quoteId,id);

CREATE TABLE deposits (
	id INT unsigned NOT NULL AUTO_INCREMENT,
	amount DECIMAL(10,2) unsigned NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE posessions (
	id INT unsigned NOT NULL AUTO_INCREMENT,
	coin VARCHAR(150) NOT NULL,
	amount DECIMAL(19,8) unsigned NOT NULL,
	PRIMARY KEY (id)
);


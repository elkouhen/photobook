db.comptes.drop(); 

db.comptes.ensureIndex( {nbComment : 1} ); 

db.comptes.insert([
{
	username : 'admin', 
	password : 'champsiome', 
	role : 'admin'
},
{
	username : 'ptsaintmartin', 
	password : 'christine', 
	role : 'user'
},
{
	username : 'stgregoire', 
	password : 'catherine', 
	role : 'user'
},
{
	username : 'bourgblanc', 
	password : 'marie', 
	role : 'user'
},
{
	username : 'kernilis', 
	password : 'gwen', 
	role : 'user'
},
{
	username : 'ploudaniel', 
	password : 'isabelle', 
	role : 'user'
},
{
	username : 'globetrotters', 
	password : 'karine', 
	role : 'user'
}
,
{
	username : 'agdal', 
	password : 'hind', 
	role : 'user'
}
,
{
	username : 'souissi', 
	password : 'ilham', 
	role : 'user'
},
{
	username : 'newyork', 
	password : 'zineb', 
	role : 'user'
},
{
	username : 'marrakech', 
	password : 'celibataire', 
	role : 'user'
}
]); 

ALTER TABLE ontology_attributes
  DROP CONSTRAINT IF EXISTS ontology_attributes_data_type_check;

ALTER TABLE ontology_relation_attributes
  DROP CONSTRAINT IF EXISTS ontology_relation_attributes_data_type_check;

UPDATE ontology_attributes
SET data_type = CASE lower(trim(data_type))
  WHEN 'string' THEN 'xsd:string'
  WHEN 'text' THEN 'xsd:string'
  WHEN 'number' THEN 'xsd:decimal'
  WHEN 'boolean' THEN 'xsd:boolean'
  WHEN 'date' THEN 'xsd:dateTime'
  ELSE trim(data_type)
END;

UPDATE ontology_relation_attributes
SET data_type = CASE lower(trim(data_type))
  WHEN 'string' THEN 'xsd:string'
  WHEN 'text' THEN 'xsd:string'
  WHEN 'number' THEN 'xsd:decimal'
  WHEN 'boolean' THEN 'xsd:boolean'
  WHEN 'date' THEN 'xsd:dateTime'
  ELSE trim(data_type)
END;

UPDATE ontology_attributes
SET data_type = 'xsd:string'
WHERE data_type NOT IN (
  'rdfs:Literal',
  'rdf:PlainLiteral',
  'rdf:langString',
  'rdf:XMLLiteral',
  'owl:real',
  'owl:rational',
  'xsd:string',
  'xsd:normalizedString',
  'xsd:token',
  'xsd:language',
  'xsd:Name',
  'xsd:NCName',
  'xsd:NMTOKEN',
  'xsd:boolean',
  'xsd:decimal',
  'xsd:integer',
  'xsd:nonNegativeInteger',
  'xsd:nonPositiveInteger',
  'xsd:positiveInteger',
  'xsd:negativeInteger',
  'xsd:long',
  'xsd:int',
  'xsd:short',
  'xsd:byte',
  'xsd:unsignedLong',
  'xsd:unsignedInt',
  'xsd:unsignedShort',
  'xsd:unsignedByte',
  'xsd:double',
  'xsd:float',
  'xsd:hexBinary',
  'xsd:base64Binary',
  'xsd:anyURI',
  'xsd:dateTime',
  'xsd:dateTimeStamp'
);

UPDATE ontology_relation_attributes
SET data_type = 'xsd:string'
WHERE data_type NOT IN (
  'rdfs:Literal',
  'rdf:PlainLiteral',
  'rdf:langString',
  'rdf:XMLLiteral',
  'owl:real',
  'owl:rational',
  'xsd:string',
  'xsd:normalizedString',
  'xsd:token',
  'xsd:language',
  'xsd:Name',
  'xsd:NCName',
  'xsd:NMTOKEN',
  'xsd:boolean',
  'xsd:decimal',
  'xsd:integer',
  'xsd:nonNegativeInteger',
  'xsd:nonPositiveInteger',
  'xsd:positiveInteger',
  'xsd:negativeInteger',
  'xsd:long',
  'xsd:int',
  'xsd:short',
  'xsd:byte',
  'xsd:unsignedLong',
  'xsd:unsignedInt',
  'xsd:unsignedShort',
  'xsd:unsignedByte',
  'xsd:double',
  'xsd:float',
  'xsd:hexBinary',
  'xsd:base64Binary',
  'xsd:anyURI',
  'xsd:dateTime',
  'xsd:dateTimeStamp'
);

ALTER TABLE ontology_attributes
  ALTER COLUMN data_type SET DEFAULT 'xsd:string';

ALTER TABLE ontology_attributes
  ADD CONSTRAINT ontology_attributes_data_type_check CHECK (
    data_type = ANY (ARRAY[
      'rdfs:Literal',
      'rdf:PlainLiteral',
      'rdf:langString',
      'rdf:XMLLiteral',
      'owl:real',
      'owl:rational',
      'xsd:string',
      'xsd:normalizedString',
      'xsd:token',
      'xsd:language',
      'xsd:Name',
      'xsd:NCName',
      'xsd:NMTOKEN',
      'xsd:boolean',
      'xsd:decimal',
      'xsd:integer',
      'xsd:nonNegativeInteger',
      'xsd:nonPositiveInteger',
      'xsd:positiveInteger',
      'xsd:negativeInteger',
      'xsd:long',
      'xsd:int',
      'xsd:short',
      'xsd:byte',
      'xsd:unsignedLong',
      'xsd:unsignedInt',
      'xsd:unsignedShort',
      'xsd:unsignedByte',
      'xsd:double',
      'xsd:float',
      'xsd:hexBinary',
      'xsd:base64Binary',
      'xsd:anyURI',
      'xsd:dateTime',
      'xsd:dateTimeStamp'
    ]::text[])
  );

ALTER TABLE ontology_relation_attributes
  ALTER COLUMN data_type SET DEFAULT 'xsd:string';

ALTER TABLE ontology_relation_attributes
  ADD CONSTRAINT ontology_relation_attributes_data_type_check CHECK (
    data_type = ANY (ARRAY[
      'rdfs:Literal',
      'rdf:PlainLiteral',
      'rdf:langString',
      'rdf:XMLLiteral',
      'owl:real',
      'owl:rational',
      'xsd:string',
      'xsd:normalizedString',
      'xsd:token',
      'xsd:language',
      'xsd:Name',
      'xsd:NCName',
      'xsd:NMTOKEN',
      'xsd:boolean',
      'xsd:decimal',
      'xsd:integer',
      'xsd:nonNegativeInteger',
      'xsd:nonPositiveInteger',
      'xsd:positiveInteger',
      'xsd:negativeInteger',
      'xsd:long',
      'xsd:int',
      'xsd:short',
      'xsd:byte',
      'xsd:unsignedLong',
      'xsd:unsignedInt',
      'xsd:unsignedShort',
      'xsd:unsignedByte',
      'xsd:double',
      'xsd:float',
      'xsd:hexBinary',
      'xsd:base64Binary',
      'xsd:anyURI',
      'xsd:dateTime',
      'xsd:dateTimeStamp'
    ]::text[])
  );

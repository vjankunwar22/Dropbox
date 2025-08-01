-- Migration: Add GIN index for full-text search on File.name
CREATE INDEX file_name_gin_idx ON "File" USING GIN (to_tsvector('english', name));

-- Migration: Add GIN index for full-text search on File.description
CREATE INDEX file_description_gin_idx ON "File" USING GIN (to_tsvector('english', coalesce(description, '')));

-- Migration: Add GIN index for full-text search on FileContent.content
CREATE INDEX filecontent_content_gin_idx ON "FileContent" USING GIN (to_tsvector('english', content)); 
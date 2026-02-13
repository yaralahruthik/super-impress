ALTER TABLE "post" ADD COLUMN "word_count" integer GENERATED ALWAYS AS (coalesce(array_length(regexp_split_to_array(nullif(trim("post"."content"), ''), '\s+'), 1), 0)) STORED;

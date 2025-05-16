# Check for file/folder conflicts in the /api directory

echo "Checking for file/folder conflicts in /api ..."

for name in chat code; do
  if [ -e "./api/$name" ]; then
    if [ -f "./api/$name" ]; then
      echo "❌ Conflict: ./api/$name is a file. It should be a folder!"
    elif [ -d "./api/$name" ]; then
      echo "✅ ./api/$name is a folder (correct)."
    else
      echo "⚠️  ./api/$name exists but is not a regular file or directory."
    fi
  else
    echo "⚠️  ./api/$name does not exist."
  fi
done

echo "Done."
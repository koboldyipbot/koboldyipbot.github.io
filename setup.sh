echo "Installing pre-commit hook to prevent js/secrets.js merges."
cp .pre-commit.sh .git/hooks/pre-commit
chmod 700 .git/hooks/pre-commit

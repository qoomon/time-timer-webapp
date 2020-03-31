#!/bin/sh
set -e -u -o pipefail

GITHUB_REPOSITORY_URI="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
GITHUB_PAGES_BRANCH="${GITHUB_PAGES_BRANCH:-"gh-pages"}"
GITHUB_PAGES_SOURCE_DIR="${GITHUB_PAGES_SOURCE_DIR:-"dist"}"
GITHUB_PAGES_REPLACE='false'

GITHUB_PAGES_DIR='.gh-pages'

COMMIT_MESSAGE="$(git log -1 --format='%s')"
COMMIT_DETAILS="$(git log -1 --format='commit %h%nAuthor: %an <%ae>%nDate:  %ad')"

echo ''
echo "--- Checkout ${GITHUB_PAGES_BRANCH} branch"
rm -rf "${GITHUB_PAGES_DIR}"
git clone --single-branch --branch "${GITHUB_PAGES_BRANCH}" --depth 1 \
  "${GITHUB_REPOSITORY_URI}" "${GITHUB_PAGES_DIR}"
  
cd "${GITHUB_PAGES_DIR}"
git config user.name "GitHub Actions"
git config user.email "<>"

echo ''
echo "--- Apply changes from ${GITHUB_PAGES_SOURCE_DIR} directory"
git rm -r --quiet .
cp -a -R "../${GITHUB_PAGES_SOURCE_DIR}/" './'
git add .

echo ''
echo "--- Commit changes"
if git commit -am "${COMMIT_MESSAGE}" -m "${COMMIT_DETAILS}" --quiet
then
    git show --name-status --format=format:
    
    echo ''
    echo '--- Push Changes'
    if [ "${GITHUB_PAGES_REPLACE}" != 'true' ]
    then
      git push 'origin' "${GITHUB_PAGES_BRANCH}"
    else
      echo 'Replace Branch'
      git checkout --orphan 'temp'       # Creates new temporary branch
      git commit -am "${COMMIT_MESSAGE}" -m "${COMMIT_DETAILS}" --quiet # Commit again
      git branch -D "${GITHUB_PAGES_BRANCH}"  # Deletes the GITHUB_PAGES_BRANCH branch
      git branch -m "${GITHUB_PAGES_BRANCH}"  # Rename the temporary branch to GITHUB_PAGES_BRANCH
      git push --force 'origin' "${GITHUB_PAGES_BRANCH}" # Force push GITHUB_PAGES_BRANCH branch
    fi
else
  echo 'No Changes'
fi

--  SETUP  --
    
    -1: git remote add origin https://github.com/guidovdijk/pushing-github-test.git

--  BRANCHES  --

To see all branches type: git branch

--  Make new branch  --.

    -1: Setup new local branch and switch to it.
        git checkout -b [name_of_your_new_branch]

    -2: Push the new branch to github.
        git push origin [name_of_your_new_branch]


--  Switch branch  --.

    -1: git checkout [name_of_your_branch]


--  Merge branch  --.

    -1: Go to the branch you want to update (In this example we're gonna update Master with another branch, you go to master)
        git checkout [name_of_your_branch]

    -2: Get the newest version of that branch.
        git pull origin [name_of_your_branch]

    -3: Merge with the branch you want.
        git merge [name_of_the_branch_you_want_to_merge]

    -4: Push the updated branch to github
        git push [name_of_your_updated_branch]


--  Delete branch (WARNING)  --.

    -1: git branch -d [name_of_your_new_branch]
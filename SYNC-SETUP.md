# Sync your projects and skills across both Macs (iCloud)

Goal: every project, your credentials, and your skills show up on both Macs
automatically, with as little effort as possible. iCloud does the syncing.
GitHub stays as an off-site backup and the way to deploy the site.

Do Part 1 and Part 2 on BOTH Macs. Both must be signed into the same Apple ID.

## Part 1: Turn on iCloud folder sync

1. Apple menu > System Settings.
2. Click your name at the top, then iCloud.
3. Turn on iCloud Drive.
4. Open its Options and turn on "Desktop & Documents Folders".
5. Let it finish uploading on the first Mac before you do the second one.

Result: your Documents folder (which holds Projects and your credentials)
now syncs to both Macs on its own. Nothing else to do for regular projects.

Tip: make sure you have enough iCloud storage for everything in Projects.
If it is tight, Apple's paid iCloud+ tiers are cheap, or move the biggest
media out of Projects.

## Part 2: Bring your skills into the sync

Skills live in a hidden folder (~/.claude/skills) that is not inside
Documents, so they need one command to join the synced area.

On your MAIN Mac (the one with the most skills), open Terminal and paste:

    mkdir -p ~/Documents/Projects/_shared
    cp -R ~/.claude/skills ~/Documents/Projects/_shared/claude-skills
    mv ~/.claude/skills ~/.claude/skills.backup
    ln -s ~/Documents/Projects/_shared/claude-skills ~/.claude/skills

Wait for iCloud to finish syncing (the _shared/claude-skills folder should
appear on the other Mac). Then on your OTHER Mac, open Terminal and paste:

    cp -R ~/.claude/skills ~/Documents/Projects/_shared/claude-skills-from-othermac 2>/dev/null || true
    mv ~/.claude/skills ~/.claude/skills.backup 2>/dev/null || true
    ln -s ~/Documents/Projects/_shared/claude-skills ~/.claude/skills

If the other Mac had skills the first one did not, they are saved in
_shared/claude-skills-from-othermac. Copy any you want to keep into
_shared/claude-skills. From now on both Macs share one skills folder.

You can delete the ~/.claude/skills.backup folders once you confirm skills
still work.

## Part 3: How GitHub and the site fit now

- iCloud moves files between your computers, so you do NOT need ./start and
  ./done just to sync anymore.
- GitHub stays as your off-site backup (in case a Mac dies) and as the way to
  put the site live. Ask the assistant to set up an automatic daily backup so
  you never have to run git by hand.
- To deploy the site, run automation/deploy.sh. That is unchanged.

One rule: do not create git repos inside the iCloud Documents folder. iCloud
and git can corrupt each other. For Well Earned Reviews specifically, keep the
git clone outside Documents (for example in your home folder) if you want the
git backup, or just let the assistant handle GitHub backups for you.

## Part 4: How to know it worked

- Make a new text file in any Projects folder on one Mac.
- Within a minute or two it should appear in the same folder on the other Mac.
- If it does, everything else in Projects (including credentials and skills)
  is syncing the same way.

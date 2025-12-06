#!/bin/bash

# Check Subscriptions Script
# Verifica che tutte le subscriptions nel progetto seguano le best practices

set -e

# Function to check a single project
check_project() {
  local PROJECT_DIR="$1"
  local PROJECT_NAME=$(echo "$PROJECT_DIR" | sed 's|projects/||; s|/src/app||')
  local ISSUES=0

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📂 Checking: $PROJECT_NAME"
  echo ""

  # Find all .subscribe( calls
  echo "📊 Finding all subscriptions..."
  SUBSCRIPTIONS=$(grep -r "\.subscribe(" "$PROJECT_DIR" --include="*.ts" 2>/dev/null | grep -v ".spec.ts" | wc -l | xargs)
  echo "   Found $SUBSCRIPTIONS subscription(s)"
  echo ""

  # Check for subscriptions without takeUntilDestroyed
  echo "⚠️  Checking for subscriptions without takeUntilDestroyed()..."
  MISSING_CLEANUP=0

  # Find files with .subscribe(
  while IFS= read -r file; do
    # Check if file contains takeUntilDestroyed or @Unsubscribe or Persistent subscription
    if ! grep -q "takeUntilDestroyed" "$file" && ! grep -q "@Unsubscribe" "$file" && ! grep -q "⚠️ Persistent subscription" "$file"; then
      # Count subscriptions in file
      SUB_COUNT=$(grep -c "\.subscribe(" "$file")

      echo "   ❌ Missing cleanup in: $file"
      echo "      Subscriptions found: $SUB_COUNT"
      echo "      Required: Add takeUntilDestroyed(), @Unsubscribe decorator, or ⚠️ Persistent subscription comment"

      # Get all subscription line numbers for GitHub annotations
      if [ -n "$GITHUB_ACTIONS" ]; then
        while IFS=: read -r line_num _; do
          echo "::error file=$file,line=$line_num,title=Missing Subscription Cleanup::Subscription has no cleanup mechanism. Add .pipe(takeUntilDestroyed()) or use @Unsubscribe decorator."
        done < <(grep -n "\.subscribe(" "$file")
      fi

      MISSING_CLEANUP=$((MISSING_CLEANUP + 1))
    fi
  done < <(find "$PROJECT_DIR" -name "*.ts" ! -name "*.spec.ts" -type f -exec grep -l "\.subscribe(" {} \; 2>/dev/null)

  if [ "$MISSING_CLEANUP" -gt 0 ]; then
    echo ""
    ISSUES=$((ISSUES + MISSING_CLEANUP))
  else
    echo "   ✅ All subscriptions have proper cleanup!"
  fi
  echo ""

  # Check for subscriptions without explanation comments
  echo "📝 Checking for subscriptions without explanation comments..."
  MISSING_COMMENTS=0
  PERSISTENT_SUBS=0

  while IFS= read -r file; do
    # Get line numbers of .subscribe(
    SUBSCRIBE_LINES=$(grep -n "\.subscribe(" "$file" | cut -d: -f1)

    for LINE in $SUBSCRIBE_LINES; do
      # Check if there's a comment within 10 lines before
      START=$((LINE - 10))
      if [ $START -lt 1 ]; then
        START=1
      fi

      # Check for either regular or persistent subscription comments
      CONTEXT_LINES=$(sed -n "${START},${LINE}p" "$file")

      if echo "$CONTEXT_LINES" | grep -q "⚠️ Persistent subscription"; then
        PERSISTENT_SUBS=$((PERSISTENT_SUBS + 1))
      elif echo "$CONTEXT_LINES" | grep -q "⚠️ Subscribe necessario"; then
        : # Valid regular subscription, do nothing
      else
        # Get context: function/method name and code snippet
        FUNC_NAME=$(sed -n "1,$((LINE-1))p" "$file" | grep -E "^\s*(public|private|protected)?\s*(async)?\s*\w+\s*\(" | tail -1 | sed 's/^\s*//;s/(.*//;s/.*\s//')
        CODE_LINE=$(sed -n "${LINE}p" "$file" | sed 's/^\s*//')

        echo "   ❌ Missing explanation comment in: $file:$LINE"
        if [ -n "$FUNC_NAME" ]; then
          echo "      Function: $FUNC_NAME"
        fi
        echo "      Code: $CODE_LINE"

        # GitHub Actions annotation
        if [ -n "$GITHUB_ACTIONS" ]; then
          echo "::error file=$file,line=$LINE,title=Missing Subscription Comment::Subscription at line $LINE is missing explanation comment. Add '⚠️ Subscribe necessario (non async pipe) perché:' or use async pipe."
        fi

        MISSING_COMMENTS=$((MISSING_COMMENTS + 1))
      fi
    done
  done < <(find "$PROJECT_DIR" -name "*.ts" ! -name "*.spec.ts" -type f -exec grep -l "\.subscribe(" {} \; 2>/dev/null)

  if [ "$MISSING_COMMENTS" -gt 0 ]; then
    echo ""
    echo "   ❌ Found $MISSING_COMMENTS subscription(s) without explanation comments!"
    echo "   All subscriptions must have a comment explaining why async pipe is not used."
    ISSUES=$((ISSUES + MISSING_COMMENTS))
  else
    echo "   ✅ All subscriptions have explanation comments!"
  fi

  if [ "$PERSISTENT_SUBS" -gt 0 ]; then
    echo "   ℹ️  Found $PERSISTENT_SUBS persistent subscription(s) (AWS/global listeners)"
  fi
  echo ""

  # Check for Observable properties in components (should use async pipe)
  echo "🔎 Checking for Observable properties that should use async pipe..."
  POTENTIAL_ASYNC_PIPE=$(grep -r ": Observable<" "$PROJECT_DIR" --include="*.component.ts" 2>/dev/null | grep -v "service.ts" | wc -l | xargs)

  if [ "$POTENTIAL_ASYNC_PIPE" -gt 0 ]; then
    echo "   ✅ Found $POTENTIAL_ASYNC_PIPE Observable property(ies) in components"
    echo "   Verify these use async pipe in templates (this is good!)"
    echo ""
    grep -r ": Observable<" "$PROJECT_DIR" --include="*.component.ts" 2>/dev/null \
      | grep -v "service.ts" \
      | sed 's/^/      - /'
  else
    echo "   ✅ No Observable properties in components (or all converted to signals)"
  fi
  echo ""

  # Return status
  if [ "$ISSUES" -eq 0 ]; then
    echo "✅ $PROJECT_NAME: All checks passed! ($SUBSCRIPTIONS subscriptions)"
    return 0
  else
    echo "❌ $PROJECT_NAME: Found $ISSUES issue(s)"
    return 1
  fi
}

# =============================================================================
# Main Script
# =============================================================================

GLOBAL_ISSUES=0

# Determine which projects to check
if [ -n "$1" ]; then
  # Specific project provided
  PROJECT_NAME="$1"
  PROJECT_DIR="projects/$PROJECT_NAME/src/app"

  if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory not found: $PROJECT_DIR"
    echo ""
    echo "Usage: $0 [project-name]"
    echo ""
    echo "Available projects:"
    for dir in projects/*/src/app; do
      if [ -d "$dir" ]; then
        proj=$(echo "$dir" | sed 's|projects/||; s|/src/app||')
        echo "  - $proj"
      fi
    done
    exit 1
  fi

  echo "🔍 Checking RxJS subscriptions in: $PROJECT_NAME"
  echo ""

  check_project "$PROJECT_DIR" || GLOBAL_ISSUES=$((GLOBAL_ISSUES + 1))

else
  # Check all projects
  echo "🔍 Checking RxJS subscriptions in all projects"
  echo ""

  PROJECTS_FOUND=0
  for PROJECT_DIR in projects/*/src/app; do
    if [ -d "$PROJECT_DIR" ]; then
      PROJECTS_FOUND=$((PROJECTS_FOUND + 1))
      check_project "$PROJECT_DIR" || GLOBAL_ISSUES=$((GLOBAL_ISSUES + 1))
      echo ""
    fi
  done

  if [ "$PROJECTS_FOUND" -eq 0 ]; then
    echo "⚠️  No projects found in projects/ directory"
    exit 0
  fi
fi

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$GLOBAL_ISSUES" -eq 0 ]; then
  echo "✅ All subscription checks passed!"
  echo ""
  echo "Best practices followed:"
  echo "  • All subscriptions have takeUntilDestroyed() or @Unsubscribe"
  echo "  • All subscriptions documented with explanation comments"
  echo "  • Preferring async pipe where applicable"
  exit 0
else
  echo "❌ Found issues in $GLOBAL_ISSUES project(s)"
  echo ""
  echo "Guidelines:"
  echo "  1. Prefer async pipe in templates"
  echo "  2. Use takeUntilDestroyed() for necessary subscriptions"
  echo "  3. Document WHY each subscription is needed with ⚠️ comment:"
  echo "     • Regular: ⚠️ Subscribe necessario (non async pipe) perché:"
  echo "     • Persistent: ⚠️ Persistent subscription: <reason>"
  echo ""
  echo "See docs/IMPLEMENTATION-ROADMAP.md section 3 for details"
  exit 1
fi

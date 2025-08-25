# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pregnancy tracking website project that provides personalized diet plans based on user input. The project uses HTML and CSS with a focus on Flexbox for layout.

## Project Structure

Since this is a new project, the recommended structure is:
- `index.html` - Main landing page with user input form
- `styles.css` - CSS styles using Flexbox for responsive layout
- `assets/` - Directory for images, icons, and other static resources

## Development Guidelines

### HTML Structure
- Create semantic HTML5 elements for better accessibility
- Include form elements for user input (pregnancy stage, health conditions, dietary preferences)
- Ensure proper form validation attributes

### CSS & Flexbox
- Use Flexbox for responsive layouts
- Mobile-first approach for better user experience
- Consider using CSS custom properties for consistent theming

### Diet Plan Implementation
- Structure diet suggestions in a clear, readable format
- Consider categorizing by trimester and specific conditions
- Make diet plans easily updatable and maintainable

## Key Features to Implement

1. User input form collecting:
   - Current pregnancy week/trimester
   - Health conditions (if any)
   - Dietary restrictions/preferences
   - Weight and height (for BMI calculation if needed)

2. Diet plan display showing:
   - Daily meal suggestions
   - Nutritional recommendations
   - Foods to avoid
   - Hydration reminders

## Testing Approach

For a static HTML/CSS site:
- Test form validation in different browsers
- Verify responsive design on various screen sizes
- Check accessibility with screen readers
- Validate HTML and CSS using W3C validators
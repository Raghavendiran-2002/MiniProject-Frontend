# Use the official nginx image as the base image
FROM nginx:alpine

# Copy the HTML, JS, and CSS files to the nginx html directory
COPY . /usr/share/nginx/html/


# Expose port 80 to the outside world
EXPOSE 80

# Start nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

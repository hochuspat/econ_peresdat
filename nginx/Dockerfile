FROM nginx:latest

COPY nginx.template.conf /nginx.template.conf

CMD ["/bin/sh" , "-c" , "envsubst '' < /nginx.template.conf > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]


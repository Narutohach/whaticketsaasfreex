#!/bin/sh

_replaceFrontendEnvVars() {
    echo "Procurando arquivos contendo variaveis a serem substituidas..."

    # Encontra todos os arquivos que contem as variaveis ou URLs especificas
    FILES=$(grep -rlE "hours_ticket_close_auto|https://api\.example\.com|http://localhost:8082|http://localhost:8080" /usr/src/app/build)

    if [ -z "$FILES" ]; then
        echo "Nenhum arquivo contendo as ocorrencias especificas encontrado."
        exit 0
    fi

    for FILE in $FILES; do
        echo "Modificando $FILE..."

        # Escapar caracteres especiais nas variaveis de ambiente
        ESCAPED_REACT_APP_HOURS_CLOSE_TICKETS_AUTO=$(printf '%s\n' "$REACT_APP_HOURS_CLOSE_TICKETS_AUTO" | sed 's:[\\/&]:\\&:g')
        ESCAPED_REACT_APP_BACKEND_URL=$(printf '%s\n' "$REACT_APP_BACKEND_URL" | sed 's:[\\/&]:\\&:g')

        # Substituir as variaveis e URLs nos arquivos
        sed -i "s/hours_ticket_close_auto/${ESCAPED_REACT_APP_HOURS_CLOSE_TICKETS_AUTO}/g" "$FILE"
        sed -i "s|https://api.example.com|${ESCAPED_REACT_APP_BACKEND_URL}|g" "$FILE"
        sed -i "s|http://localhost:8082|${ESCAPED_REACT_APP_BACKEND_URL}|g" "$FILE"
        sed -i "s|http://localhost:8080|${ESCAPED_REACT_APP_BACKEND_URL}|g" "$FILE"

        echo "$FILE modificado com sucesso."
    done
}

_replaceFrontendEnvVars
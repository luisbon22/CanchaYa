package com.luisbonilla.canchaya.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.List;

/**
 * Sirve el frontend compilado (classpath:/static). Las rutas del frontend (/canchas/1, /admin/reservas, ...)
 * las resuelve React Router en el navegador: si no existe un archivo con ese nombre se devuelve index.html,
 * de modo que recargar cualquier página del SPA funciona.
 */
@Configuration
public class SpaConfig implements WebMvcConfigurer {

    private static final String INDEX = "index.html";
    private static final List<String> PREFIJOS_BACKEND = List.of("api/", "actuator/", "v3/", "swagger-ui/");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String ruta, Resource ubicacion) throws IOException {
                        Resource solicitado = ubicacion.createRelative(ruta);
                        if (solicitado.exists() && solicitado.isReadable()) {
                            return solicitado;
                        }
                        if (!esRutaDelFrontend(ruta)) {
                            return null;
                        }
                        Resource index = ubicacion.createRelative(INDEX);
                        return index.exists() ? index : null;
                    }
                });
    }

    /** Las rutas del backend y los archivos inexistentes (con extensión) siguen respondiendo 404. */
    private static boolean esRutaDelFrontend(String ruta) {
        String ultimoSegmento = ruta.substring(ruta.lastIndexOf('/') + 1);
        return PREFIJOS_BACKEND.stream().noneMatch(ruta::startsWith) && !ultimoSegmento.contains(".");
    }
}

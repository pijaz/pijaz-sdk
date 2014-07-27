=begin

Class: ServerManager

Server manager class, used for making calls to a Pijaz API service and/or
rendering service.

PUBLIC METHODS:

buildRenderCommand(inParameters)
buildRenderServerUrlRequest(inParameters)
getApiKey()
getApiServerUrl()
getApiVersion()
getAppId()
getRenderServerUrl()
sendApiCommand(inParameters)

PRIVATE METHODS:

_buildRenderServerQueryParams(params)
_extractInfo(data)
_extractResult(data)
_httpRequest(url, method,
_isRenderRequestAllowed(product)
_parseJson(jsonString)
_processAccessToken(params, data)
_sendApiCommand(inParameters, retries)
_stringifyParameters(params, separator)

=end

PIJAZ_API_VERSION = 1
PIJAZ_API_SERVER = 'http://api.pijaz.com/'
PIJAZ_RENDER_SERVER = 'http://render.pijaz.com/'
SERVER_REQUEST_ATTEMPTS = 2

require "rubygems"
require "json"
require 'net/http'
require 'uri'

module Pijaz
  module SDK
    class ServerManager

      # PUBLIC METHODS

      # Build the set of query parameters for a render request.
      #
      # @param inParameters
      #   A hash with the following key/value pairs.
      #
      #     product: An instance of the Product class
      #     renderParameters: A hash of all params sent to the render request.
      #
      # @return
      #     If successful, a hash of query parameters to pass to the rendering
      #     server. These can be converted into a full URL by calling
      #     buildRenderServerUrlRequest(params).
      def buildRenderCommand(inParameters)
        params = inParameters
        if self._isRenderRequestAllowed(params['product'])
          self._buildRenderServerQueryParams(params)
        else
          commandParameters = {}
          commandParameters['workflow'] = params['renderParameters']['workflow']
          if params['renderParameters']['xml']
            commandParameters['xml'] = params['renderParameters']['xml']
          end
          options = {}
          options['command'] = 'get-token'
          options['commandParameters'] = commandParameters
          response = self.sendApiCommand(options)
          if response
            self._processAccessToken(params, response)
          end
        end
      end

      # Builds a fully qualified render request URL.
      #
      # @param inParameters
      #   A hash of query parameters for the render request.
      # @return:
      #   The constructed URL.
      def buildRenderServerUrlRequest(inParameters)
        url = self.getRenderServerUrl() + "render-image?" + self._stringifyParameters(inParameters)
        url
      end

      # Get the API key of the client application.
      #
      # @return:
      #   The API key.
      def getApiKey()
        @apiKey
      end

      # Get current API server URL.
      #
      # @return:
      #   The API server URL.
      def getApiServerUrl()
        @apiServer
      end

      # Get the API version the server manager is using.
      #
      # @return:
      #   The API version.
      def getApiVersion()
        @apiVersion
      end

      # Get the client application ID.
      #
      # @return:
      #   The application ID.
      def getAppId()
        @appId
      end

      # Get current render server URL.
      #
      # @return:
      #   The render server URL.
      def getRenderServerUrl()
        @renderServer
      end

      # Create a new instance of the server manager class.
      #
      # @param inParameters
      #   A hash with the following key/value pairs.
      #     appId: Required. The ID of the client application.
      #     apiKey: Required. The API key associated with the client. This key should
      #       be kept confidential, and is used to allow the associated client to
      #       access the API server.
      #     renderServer: Optional. The base URL of the rendering service. Include
      #       the trailing slash. Default: http://render.pijaz.com/
      #     apiServer: Optional. The base URL of the API service. Include
      #       the trailing slash. Default: http://api.pijaz.com/
      #     refreshFuzzSeconds: Optional. Number of seconds to shave off the lifetime
      #       of a rendering access token, this allows a smooth re-request for a new
      #       set of access params. Default: 10
      #     apiVersion: Optional. The API version to use. Currently, only version 1
      #       is supported. Default: 1
      def initialize(inParameters)
        params = inParameters
        @appId = params['appId']
        @apiKey = params['apiKey']
        @apiServer = (params['apiServer'] or PIJAZ_API_SERVER)
        @renderServer = (params['renderServer'] or PIJAZ_RENDER_SERVER)
        @refreshFuzzSeconds = (params['refreshFuzzSeconds'] or 10)
        @apiVersion = (params['apiVersion'] or PIJAZ_API_VERSION)
      end

      # Send a command to the API server.
      #
      # @param inParameters
      #   A hash with the following key/value pairs:
      #     command: Required. The command to send to the API server. One of the
      #       following:
      #         get-token: Retrieve a rendering access token for a workflow.
      #           commandParameters:
      #             workflow: The workflow ID.
      #   commandParameters: Optional. A hash of parameters. See individual
      #     command for more information
      #   method: Optional. The HTTP request type. GET or POST. Default: GET.
      # @return:
      #   If the request succeed, then a hash of the response data, otherwise two
      #   values: nil, and an error message.
      def sendApiCommand(inParameters)
        _sendApiCommand(inParameters, SERVER_REQUEST_ATTEMPTS - 1)
      end

      # PRIVATE METHODS

      # Construct a URL with all user supplied and constructed parameters
      def _buildRenderServerQueryParams(params)
        accessInfo = params['product'].getAccessInfo()
        queryParams = Marshal.load(Marshal.dump(accessInfo['renderAccessParameters']))
        if params['renderParameters'].is_a?(Hash)
          params['renderParameters'].each do |k, v|
            if v
              queryParams[k] = v
            end
          end
        end
        queryParams
      end

      # Extract the information from a server JSON response.
      def _extractInfo(data)
        json = JSON.parse(data)
        if json['result'] and json['result']['result_num'] and json['result']['result_num'] == 0
          return json['info']
        end
        false
      end

      # Extract the result from a server JSON response.
      def _extractResult(data)
        json = JSON.parse(data)
        if json['result'] and json['result']['result_num'] and json['result']['result_text']
          return json['result']
        end
        false
      end

      # Perform an HTTP request.
      #
      # @param endpoint
      #   A URI endpoint.
      # @param path
      #   A string containing the endpoint path.
      # @param method
      #   Optional. A string defining the HTTP request method to use. Only GET
      #   and POST are supported.
      # @param data
      #   A hash containing data to include in the request.
      # @return
      #   A response object.
      def _httpRequest(endpoint, path, method, data)
        method = (method and method.upcase or 'GET')

        endpoint = endpoint.sub(/(\/)+$/, '')
        uri = URI.parse(endpoint)
        http = Net::HTTP.new(uri.host, uri.port)
        if endpoint.start_with?('https://')
          http.use_ssl = true
          http.verify_mode = OpenSSL::SSL::VERIFY_NONE
        end

        request = nil
        if method == 'GET'
          if data.is_a?(Hash)
            path = path + '?' + self._stringifyParameters(data)
          end
          request = Net::HTTP::Get.new(path)
        elsif method == 'POST'
          request = Net::HTTP::Post.new(path)
          request.set_form_data = data
        end

        response = http.request(request)
        response
      end

      # Verifies that valid access parameters are attached to the product.
      def _isRenderRequestAllowed(product)
        accessInfo = product.getAccessInfo()
        if accessInfo
          expireTimestamp = accessInfo['timestamp'] + accessInfo['lifetime'] - @refreshFuzzSeconds
          if Time.now.to_i <= expireTimestamp
            return true
          end
        end
        false
      end

      # Handles setting up product access info and building render params.
      def _processAccessToken(params, data)
        accessInfo = {}

        # Store the time the access params were obtained -- used to count
        # against the lifetime param to expire the info.
        accessInfo['timestamp'] = Time.now.to_i
        # Extract the lifetime param, no need to pass this along to the
        # rendering server.
        accessInfo['lifetime'] = data['lifetime'].to_i
        data.delete('lifetime')

        accessInfo['renderAccessParameters'] = data

        params['product'].setAccessInfo(accessInfo)

        self._buildRenderServerQueryParams(params)
      end

      # Sends a command to the API server.
      def _sendApiCommand(inParameters, retries)
        params = inParameters

        path = '/' + params['command']
        method = (params['method'] or 'GET')

        params['commandParamaters'] = (params['commandParameters'] or {})
        params['commandParameters']['app_id'] = self.getAppId()
        params['commandParameters']['api_key'] = self.getApiKey()
        params['commandParameters']['api_version'] = self.getApiVersion()

        # DEBUG.
        #print("uuid: " + params['commandParameters']['request_id'] + ", command: " + params['command'])

        # TODO: fix return value
        response = self._httpRequest(@apiServer, path, method, params['commandParameters'])

        if response.code == '200' then
          jsonResult = self._extractResult(response.body)
          if jsonResult['result_num'] == 0
            return self._extractInfo(response.body)
          else
            return nil, jsonResult['result_text']
          end
        else
          if retries > 0
            retries = retries - 1
            return self._sendApiCommand(inParameters, retries)
          else
            return nil, response.code
          end
        end
      end

      # Builds a parameter string from a hash.
      # @param params
      #   Optional. A hash of query parameters, key is parameter name, value is
      #   parameter value.
      # @param separator
      #   Optional. The separator to use in the constructed string. Default '&'.
      # @return
      #   The query string.
      def _stringifyParameters(params, separator='&')
        params.keys.inject('') do |query_string, key|
          query_string << separator unless key == params.keys.first
          query_string << "#{URI.encode(key.to_s)}=#{URI.encode(params[key].to_s)}"
        end
      end

    end
  end
end

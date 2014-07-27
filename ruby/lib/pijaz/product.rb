=begin

Class: Product

Manages a renderable product.

PUBLIC METHODS:

clearRenderParameters()
generateUrl(additionalParams)
getAccessInfo()
getRenderParameter(key)
getWorkflowId()
saveToFile(filepath,additionalParams)
setAccessInfo(accessInfo)
setRenderParameter(key,newValue)
setWorkflowId(newWorkflowId)

PRIVATE METHODS:

_setFinalParams(additionalParams)

=end

require 'open-uri'

module Pijaz
  module SDK
    class Product

      # PUBLIC METHODS

      # Clear out all current render parameters.
      #
      # Any parameters currently stored with the product, including those passed
      # when the product was instantiated, are cleared.
      def clearRenderParameters()
        @renderParameters = {}
      end

      # Build a fully formed URL which can be used to make a request for the
      # product from a rendering server.
      #
      # @param additionalParams
      #   Optional. A hash of additional render parameters to be used for this
      #   request only.
      # @return
      #   A fully formed URL that can be used in a render server HTTP request.
      def generateUrl(additionalParams={})
        finalParams = self._setFinalParams(additionalParams)
        options = {}
        options['product'] = self
        options['renderParameters'] = finalParams
        params = @serverManager.buildRenderCommand(options)
        if params then
          url = @serverManager.buildRenderServerUrlRequest(params)
          url
        end
      end

      # Return the access info for the product.
      #
      # Required method for products passed to the ServerManager object.
      # @return
      #   The access info.
      def getAccessInfo()
        @accessInfo
      end

      # Retrieve a render parameter.
      #
      # @param key: The parameter name.
      # @return:
      #   The render parameter, or the default render parameter if not set.
      def getRenderParameter(key)
        value = (@renderParameters[key] or @productPropertyDefaults[key])
        value
      end

      # Return the workflow ID.
      #
      # @return:
      #   The workflow ID.
      def getWorkflowId()
        @workflowId
      end

      # Create a new product instance.
      #
      # @param inParameters
      #   A hash with the following key/value pairs.
      #
      #     serverManager: Required. An instance of the ServerManager class.
      #     workflowId: Required. The workflow ID for the product.
      #     renderParameters: Optional. A hash of render parameters to be included
      #       with every render request. They depend on the product, but these are
      #       typically supported params:
      #         message: Primary message to display.
      #         font: Font to use.
      #         halign: Horizontal justification (left, center, right, full).
      #         valign: Vertical justification (top, middle, bottom, full, even).
      #         quality: Image quality to produce (0-100).
      def initialize(inParameters)
        params = inParameters
        @serverManager = params['serverManager']
        @workflowId = params['workflowId']
        @renderParameters = (params['renderParameters'] or {})
        @accessInfo = nil
        @productPropertyDefaults = {}
      end

      # Convenience method for saving a product directly to a file.
      #
      # This takes care of generating the render URL, making the request to the
      # render server for the product, and saving to a file.
      #
      # @param filepath
      #   Required. The full file path.
      # @param additionalParams
      #   Optional. A hash of additional render parameters to be used for this
      #   request only.
      # @return
      #   True on successful save of the file, false otherwise.
      def saveToFile(filepath, additionalParams)
        url = self.generateUrl(additionalParams)
        if url
          response = open(url).read
          if response
            File.open(filepath, 'wb') do |fo|
              fo.write response 
              return true
            end
          end
        end
        false
      end

      # Set the access info for the product.
      #
      # Required method for products passed to the ServerManager object.
      def setAccessInfo(accessInfo)
        if accessInfo
          @accessInfo = accessInfo
        else
          @accessInfo = nil
        end
      end

      # Set a render parameter on the product.
      #
      # @param key
      #   The parameter name. Optionally a hash of parameter key/value pairs can
      #   be passed as the first argument, and each pair will be added.
      # @param newValue
      #   The parameter value.
      def setRenderParameter(key, newValue=nil)
        if key.is_a?(Hash)
          key.each do |k, v|
            self.setRenderParameter(k, v)
          end
        else
          param = @renderParameters[key]
          default = @productPropertyDefaults[key]
          if param != newValue
            if newValue == nil or newValue == default
              @renderParameters[key] = nil
            else
              @renderParameters[key] = newValue
            end
          end
        end
      end

      # Set the workflow ID.
      def setWorkflowId(newWorkflowId)
        if @workflowId != newWorkflowId
          @accessInfo = nil
          @workflowId = newWorkflowId
        end
      end

      # PRIVATE METHODS

      # Set the final render parameters for the product.
      #
      # @param additionalParams
      #   A hash of additional render parameters.
      def _setFinalParams(additionalParams)
        finalParams = Marshal.load(Marshal.dump(@renderParameters))
        if additionalParams.is_a?(Hash)
          additionalParams.each do |k, v|
            if v
              finalParams[k] = v
            end
          end
        end
        finalParams['workflow'] = @workflowId
        finalParams
      end

    end
  end
end
